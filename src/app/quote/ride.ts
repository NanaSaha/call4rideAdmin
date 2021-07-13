
import { UserRecord } from '../auth/userrecord.model';

export class Ride {
    public outboundRide: any;
   
    constructor(public id:string, public userId:string, public startLocation:Location, public endLocation:Location, public startAddress:string, public endAddress:string,
        public tripDate:Date, public time:Date,public fare:string, public entryDate:Date,public approveRide: boolean, public appToken:string,public user:UserRecord) 
    {

    }
}
