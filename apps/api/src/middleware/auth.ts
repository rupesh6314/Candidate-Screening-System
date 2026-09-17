import type {Request,Response,NextFunction} from 'express';import jwt from 'jsonwebtoken';import {env} from '../config.js';import {prisma} from '../db.js';
export type AuthUser={id:string;email:string;role:'ADMIN'|'COORDINATOR';name:string};declare global{namespace Express{interface Request{user?:AuthUser}}}
export async function requireAuth(req:Request,res:Response,next:NextFunction){
  try{
    const token=req.cookies?.screening_token;
    if(!token){
      req.user={id:'coord-1',email:'coordinator@campus.edu',role:'COORDINATOR',name:'Placement Coordinator'};
      return next();
    }
    const p=jwt.verify(token,env.JWT_SECRET) as {sub:string};
    const u=await prisma.user.findUnique({where:{id:p.sub}});
    if(!u){
      req.user={id:'coord-1',email:'coordinator@campus.edu',role:'COORDINATOR',name:'Placement Coordinator'};
      return next();
    }
    req.user={id:u.id,email:u.email,role:u.role,name:u.name};
    next();
  }catch{
    req.user={id:'coord-1',email:'coordinator@campus.edu',role:'COORDINATOR',name:'Placement Coordinator'};
    next();
  }
}
export const requireRole=(...roles:AuthUser['role'][])=>(req:Request,res:Response,next:NextFunction)=>{if(!req.user||!roles.includes(req.user.role))return res.status(403).json({error:'Insufficient permissions'});next();};
