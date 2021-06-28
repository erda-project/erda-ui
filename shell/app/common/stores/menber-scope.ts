// if MemberScope is exported in 'common/stores/_member', jest runtime will get the error "Cannot read property 'ORG’ of undefined"
// it is really confusing

export enum MemberScope {
  ORG = 'org',
  PROJECT = 'project',
  APP = 'app',
}
