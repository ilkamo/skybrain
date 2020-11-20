import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  opened = false;
  @Input() publicKey: string | undefined | null;
  constructor() { }

  ngOnInit(): void {
  }

  copyToClipboard(div: HTMLSpanElement, event: MouseEvent): void {
    event.preventDefault();
    const text = div.textContent;
    if (typeof text !== 'string') {
      return;
    }
    navigator.clipboard.writeText(text).then(() =>  {
      alert('Copying to clipboard was successful!');
    }, (err) => {
      alert('Could not copy text: ' + text);
    });
  }

}
