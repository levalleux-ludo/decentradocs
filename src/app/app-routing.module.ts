import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyDocumentsComponent } from './components/routes/my-documents/my-documents.component';
import { AuthenticateComponent } from './components/routes/authenticate/authenticate.component';
import { AuthGuard } from './_helpers/auth.guard';
import { PublishComponent } from './components/routes/publish/publish.component';
import { DocCheckerComponent } from './components/routes/doc-checker/doc-checker.component';
import { SearchComponent } from './components/routes/search/search.component';
import { HomeComponent } from './components/routes/home/home.component';
import { DownloadComponent } from './components/routes/download/download.component';
import { AccessCtrlComponent } from './components/routes/access-ctrl/access-ctrl.component';
import { HelpComponent } from './components/routes/help/help.component';


const commonChildren = [
  {path: 'download', outlet: 'download', component: DownloadComponent},
  {path: 'accessCtrl', outlet: 'accessCtrl', component: AccessCtrlComponent},
  {path: 'publish', outlet: 'publish', component: PublishComponent}
];

const routes: Routes = [
  { path: 'authenticate',
    component: AuthenticateComponent },
  { path: 'mydocuments',
    component: MyDocumentsComponent, canActivate: [AuthGuard],
    children: commonChildren},
  { path: 'check',
    component: DocCheckerComponent, canActivate: [AuthGuard],
    children: commonChildren},
  { path: 'search',
    component: SearchComponent, canActivate: [AuthGuard],
    children: commonChildren},
  { path: 'publish',
    component: PublishComponent, canActivate: [AuthGuard] },
  { path: 'help',
    component: HelpComponent,
    children: commonChildren},
  { path: '',
    component: HomeComponent,
    children: commonChildren},
  { path: '**',
    children: commonChildren}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
