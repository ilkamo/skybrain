import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  opened = false;
  @Input() publicKey: string | undefined | null;
  constructor(
    private cacheService: CacheService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  copyToClipboard(text: string, event: MouseEvent): void {
    event.preventDefault();
    navigator.clipboard.writeText(text).then(() => {
      alert('Public Key copied to Clipboard!');
    }, (err) => {
      alert('Could not copy text: ' + text);
    });
  }

  resolveConnectionName(publicKey: string): string {
    return this.cacheService.resolveNameFromPublicKey(publicKey);
  }

  logout() {
    this.cacheService.deleteSeed();
    window.location.reload();
  }
}
