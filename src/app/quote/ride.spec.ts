import { Ride } from './ride';

describe('Ride', () => {
  it('should create an instance', () => {
    expect(new Ride("","",null,null,"","",new Date(),0,"",new Date(),false,"")).toBeTruthy();
  });
});
