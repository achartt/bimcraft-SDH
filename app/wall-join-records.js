/* SPDX-License-Identifier: Apache-2.0 */
import {ids} from './ifc-util.js';
import {parseRecord,readRecordPset,recordError,checkRecordVersion} from './record-contract.js';
export const JOIN_PSET='CadCraft_WallJoin';
export const defaultJoinSettings=()=>({version:1,a:{allow:true,cap:'envelope'},b:{allow:true,cap:'envelope'}});
export function validateJoinSettings(input) {
 checkRecordVersion(input,'wallJoin');
 if(Object.keys(input).some(k=>!['version','a','b'].includes(k)))throw recordError('wallJoin','corrupt');
 for(const end of ['a','b']){
  const e=input[end];
  if(!e||typeof e!=='object'||Array.isArray(e)||Object.keys(e).some(k=>!['allow','cap'].includes(k))||typeof e.allow!=='boolean'||!['envelope','square'].includes(e.cap))throw recordError('wallJoin','corrupt');
 }
 return {version:1,a:{...input.a},b:{...input.b}};
}
export function readJoinRecord(w,id) {
 try {
  const ps=readRecordPset(w,id,JOIN_PSET,'wallJoin');
  if(ps===null)return {settings:defaultJoinSettings()};
  const raw=ps.Settings,settings=validateJoinSettings(parseRecord(raw,'wallJoin'));
  return {settings,raw};
 }catch(e){return {settings:null,issue:e.recordIssue||'corrupt',message:recordError('wallJoin',e.recordIssue||'corrupt').message};}
}
export function assertWallJoinsEditable(w) {
 for(const id of [...ids(w.api,w.mid,'IFCWALL'),...ids(w.api,w.mid,'IFCWALLSTANDARDCASE')]){
  const r=readJoinRecord(w,id);if(r.issue)throw recordError('wallJoin',r.issue);
 }
}
export function writeJoinSettings(w,id,input){
 const previous=readJoinRecord(w,id);if(previous.issue)throw recordError('wallJoin',previous.issue);
 const settings=validateJoinSettings(input);
 w.upsertPset(id,JOIN_PSET,[['Settings','IFCTEXT',JSON.stringify(settings)]]);
}
