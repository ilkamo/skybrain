import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  @HostBinding('class') centerText = 'd-flex flex-column';
  error?: string;
  constructor(route: ActivatedRoute) {
    this.error = route.snapshot.queryParams.error;
  }

  ngOnInit(): void {
  }

}
