import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyDocumentsComponent } from './components/routes/my-documents/my-documents.component';
import { AuthenticateComponent } from './components/routes/authenticate/authenticate.component';
import { AuthGuard } from './_helpers/auth.guard';
import { PublishComponent } from './components/routes/publish/publish.component';


const routes: Routes = [
  { path: 'authenticate', component: AuthenticateComponent },
  { path: 'mydocuments', component: MyDocumentsComponent, canActivate: [AuthGuard] },
  { path: 'publish', component: PublishComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
