import { Entity } from './Entity';
import { DomainEvent } from './DomainEvent';
import { UniqueEntityID } from './UniqueEntityID';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get id(): UniqueEntityID {
    return this._id;
  }

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    // Adiciona o evento à colecção de eventos pendentes para este Agregado
    this._domainEvents.push(domainEvent);
    this.logDomainEventAdded(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }

  private logDomainEventAdded(domainEvent: DomainEvent): void {
    const thisClass = Reflect.getPrototypeOf(this);
    const domainEventClass = Reflect.getPrototypeOf(domainEvent);
    console.info(`[Domain Event Created]:`, thisClass?.constructor.name, '==>', domainEventClass?.constructor.name);
  }
}
