import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'src/app/core/models/user.model';
import { RouteStateService } from 'src/app/core/services/route-state.service';
import { SharedService } from '../../../core/services/shared.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  pageTitle: string;
  error: string;
  uploadError: string;
  imagePath: string;
  placeholder = 'Uploader an image';
  id: number;
  userForm: FormGroup;
  user: User;
  fileHolder: File | null;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private routeStateService: RouteStateService,
  ) {this.sharedService.url = '/users'; }

  ngOnInit(): void {

    this.id = +this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.pageTitle = 'Edit User';
      this.sharedService.getById(+this.id).subscribe(
        res => {
          this.userForm.patchValue({
            id: res.id,
            nom: res.nom,
            prenom: res.prenom,
            email: res.email,
            username: res.username,
            profil: res.profil,
            phone: res.phone
          });
          this.imagePath = res.avatar;
          this.user = res;
          console.log(res);

      });

    } else {
      this.pageTitle = 'Add User';
    }
    this.userForm = this.fb.group({
      nom: new FormControl('', Validators.required),
      prenom: new FormControl('', Validators.compose([Validators.required])),
      username: new FormControl('', [Validators.required]),
      profil: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      avatar: new FormControl(null),
      id: new FormControl(''),
    });
  }

  onSelectedFile(event): void {
    if (event.target.files.length > 0) {
      this.fileHolder = event.target.files[0];
      this.placeholder =  this.fileHolder.name + ' is selected';
      this.userForm.controls['avatar'].setValue(this.fileHolder);
    }
  }


  onSubmit() {

    const formData  = new FormData();
    console.log(this.userForm);

    formData.append('nom', this.userForm.get('nom').value);
    formData.append('prenom', this.userForm.get('prenom').value);
    formData.append('email', this.userForm.get('email').value);
    formData.append('username', this.userForm.get('username').value);
    formData.append('phone', this.userForm.get('phone').value);
    formData.append('avatar', this.userForm.get('avatar').value.name);
    // formData.append('avatar', new Blob([this.userForm.get('avatar').value], { type: 'application/octet-stream' }), 'file.bin');

    if (this.id ) {
      this.updateUrl();
      formData.append('id', this.userForm.get('id').value);
      formData.append('profil_id', this.userForm.get('profil').value);
  
      this.sharedService.update(formData, this.id).subscribe(
        res => {
          if (res.status === 'error') {
            this.uploadError = res.message;
          } else {
            console.log(res);

            this.router.navigate(['/admin/users/user-list']);
          }
        },
        error => this.error = error
      );
    } else {
      console.log(formData);

      formData.append('profil', this.userForm.controls['profil'].value);
      this.sharedService.create(formData).subscribe(
        res => {
          console.log('uuu');

          if (res.status === 'error') {
            this.uploadError = res.message;
          } else {
            this.router.navigate(['/admin/users/user-list']);
          }
        },

        error => {
          this.error = error,
          console.log(error);
        }
      );
    }
  }

  private updateUrl() {
    const routeState = this.routeStateService.getCurrent();

    if (routeState.data  === '/api/admin/profils/1') {
        this.sharedService.url = '/admin/users';

    } else if (routeState.data  === '/api/admin/profils/3') {
       this.sharedService.url = '/admin/users/formateurs';

    } else if (routeState.data  === '/api/admin/profils/4') {
      this.sharedService.url = '/admin/users/cms';

    } else if (routeState.data  === '/api/admin/profils/2') {
      this.sharedService.url = '/admin/users/apprenants';
    }
  }


  clearInputFields(e) {
    const all = e.target.querySelectorAll('input');
     Object.keys(all).forEach(key => {
         console.log(all[key].value = '');
     });
   }
}
