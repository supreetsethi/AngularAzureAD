// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'http://localhost:44390/',
  scopeUri: ['api://<Scope-URI>/Web-API'],
  tenantId: '<Tenant-GUID>',
  uiClienId: '<Client-GUID>',
  redirectUrl: 'http://localhost:4200',
  authorityDomain: '<Domain>',
  b2cPolicies: {
    names: {
      signUpSignIn: "",
      resetPassword: "",
      editProfile: ""
    },
    authorities: {
      signUpSignIn: {
        authority: ""
      },
      resetPassword: {
        authority: ""
      },
      editProfile: {
        authority: ""
      }
    },
    authorityDomain: "anandit2017gmail.onmicrosoft.com"
  },
  postLogoutUrl:"http://localhost:4200"
};

