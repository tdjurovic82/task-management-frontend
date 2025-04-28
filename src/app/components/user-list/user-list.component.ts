import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {RouterLink} from '@angular/router';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [ NgFor, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: any[] = [];

  private http = inject(HttpClient);
  private userService = inject(UserService);

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/users').subscribe(
      data => {
        console.log('User list:', data);
        this.users = data;
        this.userService.users$.subscribe(users => {  });
      },
      error => {
        console.error('Error loading users', error);
      }
    );
  }
}
