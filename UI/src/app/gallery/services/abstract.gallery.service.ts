import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {GalleriesDefinition} from "../api/gallery";


@Injectable()
export abstract class AbstractGalleryService {
  abstract getGalleryDefinition$(): Observable<GalleriesDefinition>;
}
