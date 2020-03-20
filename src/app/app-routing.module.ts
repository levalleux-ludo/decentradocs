import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyDocumentsComponent } from './components/routes/my-documents/my-documents.component';


const routes: Routes = [
  { path: 'mydocuments', component: MyDocumentsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
