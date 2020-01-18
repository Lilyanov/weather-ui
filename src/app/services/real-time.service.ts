import { Injectable } from '@angular/core';
import { StompConfig, StompRService, StompState } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs'
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthorizationService } from './authorization.service';


@Injectable({
    providedIn: 'root'
})
export class RealTimeService {

    private static stompConfig: StompConfig = {
        url: environment.wsHost,
        headers: {},
        heartbeat_in: 20000, // Typical value 0 - disabled
        heartbeat_out: 20000, // Typical value 20000 - every 20 seconds
        reconnect_delay: 5000,
        debug: false
    };

    constructor(private stompRService: StompRService, private authorizationService: AuthorizationService) {
        this.connectToWebsocket();
    }

    public disconectFromWebsocket() {
        if (this.stompRService.connected()) {
            this.stompRService.disconnect();
        }
    }

    public connectToWebsocket() {
        if (!this.stompRService.connected()) {
            this.stompRService.config = RealTimeService.stompConfig;
            this.stompRService.initAndConnect();
        }
    }

    public getSocketConnectionState(): BehaviorSubject<StompState> {
        return this.stompRService.state;
    }

    public getDeviceStatus(): Observable<Message> {
        return this.stompRService.subscribe('/devices');
    }

    public getTimeseries(): Observable<Message> {
        return this.stompRService.subscribe('/measurements');
    }

}