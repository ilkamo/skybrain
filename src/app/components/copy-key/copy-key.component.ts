import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-copy-key',
  templateUrl: './copy-key.component.html',
  styleUrls: ['./copy-key.component.scss']
})
export class CopyKeyComponent implements OnInit {
  @Input() publicKey?: string;

  constructor() { }

  ngOnInit() {
  }

  copyToClipboard(publicKey: string, event: MouseEvent): void {
    event.preventDefault();
    navigator.clipboard.writeText(publicKey).then(() => {
      alert(`Public Key: ${publicKey} copied to clipboard!`);
    }, (err) => {
      alert('Could not copy Public Key: ' + publicKey);
    });
  }
}
