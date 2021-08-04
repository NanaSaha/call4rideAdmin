import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WatchDriverNavigationPage } from './watch-driver-navigation.page';

describe('WatchDriverNavigationPage', () => {
  let component: WatchDriverNavigationPage;
  let fixture: ComponentFixture<WatchDriverNavigationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchDriverNavigationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WatchDriverNavigationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
