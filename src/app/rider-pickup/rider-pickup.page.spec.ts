import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RiderPickupPage } from './rider-pickup.page';

describe('RiderPickupPage', () => {
  let component: RiderPickupPage;
  let fixture: ComponentFixture<RiderPickupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderPickupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RiderPickupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
