<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
=======
import { UserMemory } from 'src/app/models/user-memory';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { from, Observable } from 'rxjs';

>>>>>>> fd9feee7c3b559e72c8431153fdcec48e1b2c9d4
@Component({
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit {
<<<<<<< HEAD
  memory: Memory | null = null;

  constructor(route: ActivatedRoute) {
    this.memory = route.snapshot.data.memory;
  }

  ngOnInit(): void {
=======
  base64Link: string;
  memory: UserMemory | null = null;
  error$: string | null = null;

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
    } else {
      this.error$ = 'no base link provided';
    }
>>>>>>> fd9feee7c3b559e72c8431153fdcec48e1b2c9d4
  }
}
