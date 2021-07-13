import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RideRequestsPage } from './ride-requests.page';

describe('RideRequestsPage', () => {
  let component: RideRequestsPage;
  let fixture: ComponentFixture<RideRequestsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RideRequestsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RideRequestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
