import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyDocumentsComponent } from './components/routes/my-documents/my-documents.component';
import { AuthenticateComponent } from './components/routes/authenticate/authenticate.component';
import { AuthGuard } from './_helpers/auth.guard';
import { PublishComponent } from './components/routes/publish/publish.component';
import { DocCheckerComponent } from './components/routes/doc-checker/doc-checker.component';
import { SearchComponent } from './components/routes/search/search.component';
import { HomeComponent } from './components/routes/home/home.component';


const routes: Routes = [
  { path: 'authenticate', component: AuthenticateComponent },
  { path: 'mydocuments', component: MyDocumentsComponent, canActivate: [AuthGuard] },
  { path: 'check', component: DocCheckerComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'publish', component: PublishComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
