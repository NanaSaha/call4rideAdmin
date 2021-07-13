import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PhoneSigninPage } from './phone-signin.page';

describe('PhoneSigninPage', () => {
  let component: PhoneSigninPage;
  let fixture: ComponentFixture<PhoneSigninPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneSigninPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneSigninPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
