import { Injectable } from '@nestjs/common';
import { Incident as IncidentEntity } from 'src/core/db/entities/incident.entity';
import type { Incident } from 'src/core/interfaces/incident.interface';
import { EmailOptions } from 'src/core/interfaces/mail-options.interface';
import { EmailService } from 'src/email/email.service';
import { generateIncidentEmailTemplate } from './templates/incident-email.template';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { envs } from 'src/config/envs';
import { logger } from 'src/config/logger';
import { CacheService } from 'src/cache/cache.service';
// npm run start:dev
const CACHE_KEY_ALL_INCIDENTS = "incidents:all";
@Injectable()
export class IncidentsService {
    constructor(
        @InjectRepository(IncidentEntity)
        private readonly incidentRepository: Repository<IncidentEntity>,
        private readonly emailService : EmailService,
        private readonly cacheService: CacheService
    ){}

    private readonly redis = new Redis({
        host: envs.REDIS_HOST,
        port: envs.REDIS_PORT
    })

    async getIncidents() : Promise<IncidentEntity[]>{
        try{
            logger.info("[IncidentService] intentando traer incidentes desde cache")
            const data = await this.cacheService.get<IncidentEntity[]>(CACHE_KEY_ALL_INCIDENTS) ?? '';
            if(data && data.length > 0){
                logger.info(`[IncidentService] incidentes encontrados en cache: ${data.length}`)
                return data;
            }
            logger.info("[IncidentService] trayendo incidentes")
            const incidents = await this.incidentRepository.find();
            logger.info("[IncidentService] guardando incidentes en cache")
            logger.info(`[IncidentService] incidentes encontrados: ${incidents.length}`)
            await this.cacheService.set(CACHE_KEY_ALL_INCIDENTS, incidents);
            return incidents;
        } catch(error){
            console.error("[IncidentService] error al traer incidentes:", error);

            return [];

        }
    }

    async getIncidentsByRadius(lat: number, lon: number, radiusInMeters: number) : Promise<IncidentEntity[]>{
        try{
            const incidents = await this.incidentRepository
            .createQueryBuilder("incident")
            .where(`ST_DWithin(
                incident.location::geography,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radius
            )`,{lat, lon, radius: radiusInMeters})
            console.log(`[IncidentService] incidentes encontrados por radio: ${radiusInMeters}m`)

            return incidents.getMany();

        } catch(error){
            console.error("[IncidentService] error al traer incidentes por radio:", error);
            return [];
        }
    }
 
    async createIncident(incident:Incident) : Promise<Boolean>{
        const newIncident = this.incidentRepository.create({
            title: incident.title,
            description: incident.description,
            type: incident.type,
            location:{
                type: 'Point',
                coordinates:[incident.lon, incident.lat]
            }
        })
        await this.incidentRepository.save(newIncident);
        await this.redis.del(CACHE_KEY_ALL_INCIDENTS);
        const template = generateIncidentEmailTemplate(incident)
        const options : EmailOptions = {
            to: "devjdfr@gmail.com",
            subject: incident.title,
            html: template
        }
        const result = await this.emailService.sendEmail(options);
        return result;
    }
}