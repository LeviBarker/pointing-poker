import {Injectable} from '@angular/core';
import {fetchAndActivate, getValue as _getValue, RemoteConfig} from "@angular/fire/remote-config";

interface RemoteConfigProperties {
  title: string;
  theme: any;
  logoUrl: any;
  bannerButton: any;
}

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {

  constructor(private remoteConfig: RemoteConfig) {
    this.remoteConfig.settings.minimumFetchIntervalMillis = 300000;
    this.remoteConfig.settings.fetchTimeoutMillis = 10000;
    this.remoteConfig.defaultConfig = {
      app_name: 'Pointing Poker',
      theme: JSON.stringify({
        'background-color': '#ffffff',
        'color': '#314a52',
      }),
      logo_url: 'assets/Playing-Cards.svg',
      card_options: [
        '1,2,3,4,5',
        '1,2,3,4,5,6,7,8,9,10',
        '0.5,1,2,3,5,8,13,20',
        'XXS,XS,S,M,L,XL,XXL',
      ].join(':'),
    };
  }

  async getValues(): Promise<RemoteConfigProperties> {
    await fetchAndActivate(this.remoteConfig);
    const bannerButtonString = this.getValue('banner_button').asString();

    return {
      title: this.getValue('app_name').asString(),
      theme: JSON.parse(this.getValue('theme').asString()),
      logoUrl: this.getValue('logo_url').asString(),
      bannerButton: bannerButtonString ? JSON.parse(bannerButtonString) : null
    };
  }

  getValue(key: string) {
    return _getValue(this.remoteConfig, key);
  }
}
