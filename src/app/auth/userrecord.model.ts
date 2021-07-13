import { PlaceLocation } from "../shared/model/location.model";

export class UserRecord {

  constructor(
    public id: string,
    public firstName: string,
    public lastName: string,
    public description: string,
    public imageUrl: string,
    public phone: string,
    public email: string,
    public entryDate: Date,
    public updateDate: Date,
    public userId: string,
    public location: PlaceLocation,
    public roles: any
  ) {}
}
