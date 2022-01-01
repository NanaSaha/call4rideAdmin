import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EntrancePage } from './entrance.page';

describe('EntrancePage', () => {
  let component: EntrancePage;
  let fixture: ComponentFixture<EntrancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EntrancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
