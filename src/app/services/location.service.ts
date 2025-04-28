import {Injectable, numberAttribute} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private apiUrl = 'http://localhost:8080/locations';

  constructor(private http: HttpClient) {}

  getLocation(uprn: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-uprn/${uprn}`);
  }

  getLocations(uprns: number[]): Observable<any> {
    let params = new HttpParams();

    uprns.forEach(uprn => {
      params = params.append('uprns', uprn.toString());
    });

    return this.http.get<any>(`${this.apiUrl}/by-uprn`, { params });
  }
  getOltByUprn(uprn: number): Observable<string> {
    return this.http.get<string>(`http://localhost:8080/locations/olts?uprn=${uprn}`, {
      responseType: 'text' as unknown as 'json'
    });
  }
  isActivated(uprn: number) : Observable<boolean> {
    return this.http.get<boolean>(`http://localhost:8080/activate/check?uprn=${uprn}`, {
      //responseType: 'text' as unknown as 'json'
    });
  }

}
