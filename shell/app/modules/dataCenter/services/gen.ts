function genExport() {
  const serviceName = '';
  const paramsType = `T_${serviceName}_params`;

  const returnType = `T_${serviceName}_data`;
  return `export const ${serviceName} = apiCreator<(p: ${paramsType}) => ORG_CLUSTER.ICluster[]>(apis.getClusterList);`;
  // export const getDomainList = apiCreator<(p: IDomainRequest & IPagingReq) => IPagingData<DOMAIN_MANAGE.IDomain>>(
  //   apis.getDomainList,
  // );
}
