import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ChangepassService } from 'src/app/services/changepass.service';

@Component({
  selector: 'app-changepass',
  standalone: true,
  imports: [RouterModule, MaterialModule, NgIf, FormsModule, ReactiveFormsModule],
  templateUrl: './changepass.component.html',
})
export class ChangepassComponent {
  form !: FormGroup;
  constructor(private settings: CoreService, private router: Router, private formBuilder: FormBuilder, private changepassService : ChangepassService) { 
    this.form = this.formBuilder.group({
      email : ['', [Validators.required, Validators.email] ]
    })
  }

  get f() {
    return this.form.controls;
  }

  enviar(){
    this.changepassService.changePass(this.form.value).subscribe({
      next : (resp : any) => {
        console.log(resp);
      },
      error : (error: any) => {
        console.log(error);
      }
    })
  }

}
