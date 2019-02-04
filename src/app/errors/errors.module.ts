import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayerrorComponent } from './payerror/payerror.component';
import { Routes, RouterModule } from '@angular/router';
import * as material from '@angular/material';
const routes: Routes = [
  { path: 'pay', component: PayerrorComponent},

];
@NgModule({
  declarations: [PayerrorComponent],
  imports: [
    CommonModule,
    material.MatIconModule,
    material.MatCardModule,
    RouterModule.forChild(routes)
  ]
})
export class ErrorsModule { }
