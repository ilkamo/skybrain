import { UserMemory } from 'src/app/models/user-memory';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { from, Observable } from 'rxjs';

@Component({
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit {
  base64Link: string;
  memory: UserMemory | null = null;
  error$ = null;

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router) {
    this.base64Link = this.route.snapshot.queryParams.q || '';
  }

  ngOnInit(): void {
    if (this.base64Link) {
      from(this.apiService.resolveMemoryFromBase64(this.base64Link)).subscribe(memory => {
        if (memory) {
          this.memory = memory;
        }
      },
        error => {
          this.error$ = error;
        });
    }
  }
}
