// Prueba del Resumen de Arata (D-114). Correr:  npx -y tsx scripts/prueba-resumen.ts  — todo debe salir con ✓.
import { resumenAgencia } from "../lib/panel/resumen/agencia";
const ok=(c:boolean,m:string)=>{console.log((c?"✓ ":"✗ ")+m); if(!c) process.exitCode=1;};
const reglas={tarifaDia:80000};
const P=(id:string,estado:any,valor:number,cierre:string|null,cliente:string,serv="s1",limite:string|null=null)=>({id,nombre:id,clienteId:cliente,servicioId:serv,estado,valor,fechaCierre:cierre,fechaInicio:null,fechaLimite:limite,repartoCongelado:null,notas:null});
const d:any={negocioId:"n",puedeEditar:true,puedeMarcarPasos:true,miPersonaId:null,demo:false,personas:[],config:{...reglas,reservaMeses:3,actualizado:null},
 proyectos:[P("a","cerrado",2_000_000,"2026-11-01","c1"),P("b","cerrado",1_000_000,"2026-10-25","c2","s2"),P("c","cerrado",500_000,"2026-09-20","c1"),P("d","en-curso",3_000_000,null,"c3","s1","2026-11-05"),P("e","propuesta",900_000,null,"c4")],
 gastos:[{id:"g",proyectoId:"a",concepto:"x",categoria:"otros",valor:200_000,fecha:"2026-11-01"}],trabajo:[],gastosFijos:[],
 servicios:[{id:"s1",nombre:"Página",categoria:"pagina-web",activo:true},{id:"s2",nombre:"Tienda",categoria:"catalogo",activo:true}],clientes:[],
 tareas:[{id:"t1",proyectoId:"d",etapa:"arranque",texto:"x",hecha:true,orden:0},{id:"t2",proyectoId:"d",etapa:"diseno",texto:"y",hecha:false,orden:1}]};
const C=(id:string,creado:string,origen:string,proys:any[])=>({id,nombre:id,empresa:null,telefono:"1",correo:null,ciudad:null,sitioWeb:null,instagram:null,estado:"nuevo",origen,origenDetalle:null,notas:null,creado,proyectos:proys});
const cl:any=[C("c1","2026-09-01","Instagram",[{estado:"cerrado"},{estado:"cerrado"}]),C("c2","2026-10-20","Referido",[{estado:"cerrado"}]),C("c3","2026-11-02","Instagram",[{estado:"en-curso"}]),C("c4","2026-11-08","Google",[{estado:"propuesta"}]),C("c5","2026-11-09","Instagram",[])];
const r=resumenAgencia(d,cl,"2026-11-10",30);
ok(r.ventas===3_000_000 && r.proyectosVendidos===2,"30 días: ventas 3.000.000 (2 proyectos) → "+r.ventas);
ok(r.ventasAnt===500_000 && Math.round(r.deltaVentas!)===500,"periodo anterior 500.000 → +500 %");
ok(r.ganancia===2_800_000,"ganancia 2.800.000 (resta el gasto de 200.000)");
ok(r.clientesNuevos===4,"clientes nuevos en 30 días: 4 → "+r.clientesNuevos);
ok(r.enProceso===1 && r.tarde===1,"1 en proceso, va tarde (entrega 5 nov)");
ok(r.abiertos[0].a.etapaActual==="diseno" && r.abiertos[0].a.pct===50,"proyecto abierto en Diseño, 50 %");
ok(r.embudo.clientes===5 && r.embudo.conProyecto===4 && r.embudo.compraron===2 && r.tasa===40,"embudo 5 → 4 → 2 · compran 40 %");
ok(r.origenes[0].origen==="Instagram" && r.origenes[0].clientes===3 && r.origenes[0].compraron===1,"Instagram: 3 clientes, 1 compró");
ok(r.servicios[0].nombre==="Página" && r.servicios[0].ventas===2_000_000,"lo que más se vende: Página 2.000.000");
ok(r.meses.length===12 && r.meses[11].mes==="2026-11" && r.meses[11].ventas===2_000_000 && r.meses[10].ventas===1_000_000,"ventas por mes: nov 2.000.000, oct 1.000.000");
ok(r.porCobrar===3_000_000 && r.propuestas.length===1,"en curso por cobrar 3.000.000 · 1 propuesta");
const r365=resumenAgencia(d,cl,"2026-11-10",365); ok(r365.ventas===3_500_000,"365 días: 3.500.000");
