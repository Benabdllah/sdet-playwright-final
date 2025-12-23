// config/roleFilter.ts
export function getRoleTag() {
  const role = (process.env.ROLE || 'guest').toLowerCase();
  const map: Record<string, RegExp> = {
    admin:      /@admin/,
    customer:   /@customer/,
    supporter:  /@supporter/,
    genehmiger: /@genehmiger/,
    guest:      /@guest/,
  };
  return map[role] || /.*/;
}