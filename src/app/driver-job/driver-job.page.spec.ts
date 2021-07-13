import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DriverJobPage } from './driver-job.page';

describe('DriverJobPage', () => {
  let component: DriverJobPage;
  let fixture: ComponentFixture<DriverJobPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverJobPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DriverJobPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
