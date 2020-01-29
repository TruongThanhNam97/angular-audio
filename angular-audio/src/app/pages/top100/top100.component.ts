import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-top100',
  templateUrl: './top100.component.html',
  styleUrls: ['./top100.component.scss']
})
export class Top100Component implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  onNavigateToTop100Love() {
    this.router.navigate(['top100Loves'], { relativeTo: this.route, queryParams: { top100Love: 'top100Love' } });
  }

  onNavigateToTop100Hear() {
    this.router.navigate(['top100Hear'], { relativeTo: this.route, queryParams: { top100Hear: 'top100Hear' } });
  }

}
