import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DriverDashboardPage } from './driver-dashboard.page';

describe('DriverDashboardPage', () => {
  let component: DriverDashboardPage;
  let fixture: ComponentFixture<DriverDashboardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverDashboardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DriverDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
