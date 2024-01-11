import { Injectable } from '@angular/core';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { ChatDataService } from './chat-data.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  openai!: OpenAIApi;

  messages: ChatCompletionRequestMessage[] = [];
  private messagesSubject = new BehaviorSubject<ChatCompletionRequestMessage[]>(
    []
  );

  constructor(private chatDataService: ChatDataService,private http: HttpClient) {
    this.updateConfiguration();
  }

  public updateConfiguration(): void {
    const configuration = new Configuration({
      apiKey: this.chatDataService.getAPIKeyFromLocalStore() ?? '',
    });

    this.openai = new OpenAIApi(configuration);
  }

  async createCompletionViaOpenAI(messages: ChatCompletionRequestMessage[]) {
    return await this.openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Agent': 'OpenAPI-Generator/1.0/Javascript',
        },
      }
    );
  }


  private handleError(error: any): Observable<never> {
    const errorMessage = `API request failed. Error: ${error.message}`;
    console.error(errorMessage);
    return throwError(errorMessage);
  }
  // async createCompletionViaLocalAI(messages: ChatCompletionRequestMessage[]) {
  //   debugger
  //   var apiUrl = 'https://localhost:52914/Chat/Send';

  //   const requestObject = { text:"Hi"};

  //  var result =  await this.http.post<string>(apiUrl, requestObject)
  //    .pipe(
  //      catchError(this.handleError)
  //    ); 
  //   return result;
   
  // }
  async createCompletionViaLocalAI(messages: ChatCompletionRequestMessage[]) {
    try {
      const isUserRole = (messages:ChatCompletionRequestMessage) => messages.role === "user";

      const lastUserMessageContent = messages.slice().reverse().find(isUserRole)?.content;
    
      
      const apiUrl = 'https://localhost:52914/Chat/Send';
  
      const requestObject = { text: lastUserMessageContent };
  
      const response = await this.http.post(apiUrl, requestObject, { responseType: 'text' }).toPromise();
  
      // Return the response as a string
      return response?.replace("User:", '');
    } catch (error) {
      console.error('Error in createCompletionViaLocalAI:', error);
      throw error; // Rethrow the error to handle it at the caller level if needed.
    }
  }
  
  
  
  async getTitleFromChatGpt(messages: ChatCompletionRequestMessage[]) {
    return await this.openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `create a max 10 character title from below messages. ${JSON.stringify(
              messages
            )}`,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Agent': 'OpenAPI-Generator/1.0/Javascript',
        },
      }
    );
  }

  public setMessagesSubject(event: ChatCompletionRequestMessage[]) {
    this.messagesSubject.next(event);
  }

  public getMessagesSubject(): Observable<ChatCompletionRequestMessage[]> {
    return this.messagesSubject.asObservable();
  }
}
