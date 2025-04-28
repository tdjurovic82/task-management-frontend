import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import {TaskDetailsComponent} from './components/task-details/task-details.component';

export const routes: Routes = [
  { path: '', component: TaskListComponent },  // pocetna stranica tasks
  { path: 'users', component: UserListComponent }, // korisnici
  { path: 'tasks/:id', component: TaskDetailsComponent } // detalji taska
];
