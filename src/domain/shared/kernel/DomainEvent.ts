import { UniqueEntityID } from './UniqueEntityID';

export interface DomainEvent {
  /**
   * Data/Hora em que o evento ocorreu. É crucial que este valor seja imutável.
   */
  dateTimeOccurred: Date;
  
  /**
   * O Agregado Root que despachou este evento.
   */
  getAggregateId(): UniqueEntityID;
}
