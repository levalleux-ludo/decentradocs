import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FileSaverModule } from 'ngx-filesaver';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EthereumModule } from './ethereum/eth.module';
import { ArweaveModule } from './arweave/arweave.module';
import { MaterialFileUploadComponent } from './components/material-file-upload/material-file-upload.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ArweaveConnectComponent } from './components/arweave-connect/arweave-connect.component';
import { WindowRef } from './_helpers/WindowRef';
import { DocumentUploadFormComponent } from './components/document-upload-form/document-upload-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { LeftMenuBarComponent } from './components/left-menu-bar/left-menu-bar.component';
import { MyDocumentsComponent } from './components/routes/my-documents/my-documents.component';
import { SharedDocumentsComponent } from './components/routes/shared-documents/shared-documents.component';
import { DocCheckerComponent } from './components/routes/doc-checker/doc-checker.component';
import { SearchComponent } from './components/routes/search/search.component';
import { PublishComponent } from './components/routes/publish/publish.component';
import { AuthenticateComponent } from './components/routes/authenticate/authenticate.component';
import { EthereumConnectComponent } from './components/ethereum-connect/ethereum-connect.component';
import { HomeComponent } from './components/routes/home/home.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { DocumentDetailsComponent, ReversePipe } from './components/document-details/document-details.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { MaterialFileSelectComponent } from './components/material-file-select/material-file-select.component';
import { DownloadComponent } from './components/routes/download/download.component';

@NgModule({
  declarations: [
    AppComponent,
    MaterialFileUploadComponent,
    ArweaveConnectComponent,
    DocumentUploadFormComponent,
    ConfirmDialogComponent,
    NavbarComponent,
    ProfileDetailsComponent,
    LeftMenuBarComponent,
    MyDocumentsComponent,
    SharedDocumentsComponent,
    DocCheckerComponent,
    SearchComponent,
    PublishComponent,
    AuthenticateComponent,
    EthereumConnectComponent,
    HomeComponent,
    DocumentListComponent,
    DocumentDetailsComponent,
    ReversePipe,
    DocumentUploadComponent,
    MaterialFileSelectComponent,
    DownloadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    EthereumModule,
    ArweaveModule,
    MatIconModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileSaverModule,
    HttpClientModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatStepperModule,
    FlexLayoutModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatListModule,
    MatBadgeModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatMenuModule,
    MatRadioModule
  ],
  providers: [FormBuilder, WindowRef],
  bootstrap: [AppComponent],
  entryComponents: [
    DocumentUploadFormComponent,
    ConfirmDialogComponent
  ]
})
export class AppModule { }
