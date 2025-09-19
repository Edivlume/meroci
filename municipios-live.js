// municipios-live.js
// Rellena CATALOGOS consultando INEGI en tiempo real (100%) sin archivo local.
// Requiere que exista window.CATALOGOS con { estados:[], ciudades:{} }.

(async function(){
  const ENTIDADES = [
    ["01","Aguascalientes"],["02","Baja California"],["03","Baja California Sur"],
    ["04","Campeche"],["05","Coahuila"],["06","Colima"],["07","Chiapas"],
    ["08","Chihuahua"],["09","Ciudad de México"],["10","Durango"],["11","Guanajuato"],
    ["12","Guerrero"],["13","Hidalgo"],["14","Jalisco"],["15","México"],
    ["16","Michoacán"],["17","Morelos"],["18","Nayarit"],["19","Nuevo León"],
    ["20","Oaxaca"],["21","Puebla"],["22","Querétaro"],["23","Quintana Roo"],
    ["24","San Luis Potosí"],["25","Sinaloa"],["26","Sonora"],["27","Tabasco"],
    ["28","Tamaulipas"],["29","Tlaxcala"],["30","Veracruz"],["31","Yucatán"],["32","Zacatecas"]
  ];
  const BASE = "https://www.inegi.org.mx/app/ageeml/api/ageeml/municipios";

  async function fetchMun(ent){
    const url = `${BASE}?entidad=${ent}&formato=json`;
    const r = await fetch(url);
    if(!r.ok) throw new Error(`INEGI ${ent} ${r.status}`);
    const data = await r.json();
    return (data?.municipios || data || [])
      .map(x => x.NOM_MUN || x.nom_mun || x.nombre || x.NOM_MUNICIPIO || x.municipio)
      .filter(Boolean).map(s=>s.normalize("NFC"))
      .sort((a,b)=> a.localeCompare(b,'es'));
  }

  if(!window.CATALOGOS) window.CATALOGOS = { estados: [], ciudades: {} };
  CATALOGOS.estados = ENTIDADES.map(e=>e[1]);

  for(const [cve, nombre] of ENTIDADES){
    try{
      CATALOGOS.ciudades[nombre] = await fetchMun(cve);
    }catch(e){
      console.warn('INEGI municipios error', nombre, e.message);
      CATALOGOS.ciudades[nombre] = CATALOGOS.ciudades[nombre] || [];
    }
  }

  // Dispara evento para quien quiera re-renderizar selects
  document.dispatchEvent(new CustomEvent('catalogos:listos'));
})();
