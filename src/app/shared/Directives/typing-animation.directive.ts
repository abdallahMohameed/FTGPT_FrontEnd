import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTypingAnimation]'
})
export class TypingAnimationDirective {
  @Input('appTypingAnimation') text: string | undefined;
  private delay = 40; 

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.animateText();
  }

  private animateText(): void {
    const textArray = this.text?.split('');

    textArray?.forEach((char, index) => {
      setTimeout(() => {
        this.renderer.setProperty(this.el.nativeElement, 'innerHTML',  this.formatText(this.text?.slice(0, index + 1)));
      }, this.delay * index);
    });
  }

  private formatText(text?: string): string {
    if(text){
      return text
      .replace(/\n/g, '<br>') 
      .replace(/\* /g, '&bull; '); 
  
    }else{
      return "";
    }
    }

}