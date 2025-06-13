import { sendDepositEvent as sendKafkaDepositEvent, connectProducer } from './kafka';
import { sendDepositEvent as sendApiDepositEvent, connectAPI } from './apiProcessor';

export type ProcessorType = 'KAFKA' | 'API';

export async function connectEventProcessor(processorType: ProcessorType) {
  switch (processorType) {
    case 'KAFKA':
      await connectProducer();
      break;
    case 'API':
      await connectAPI();
      break;
    default:
      throw new Error(`Unsupported processor type: ${processorType}`);
  }
}

export async function sendDepositEvent(event: any) {
  const processorType = (process.env.PROCESSOR || 'KAFKA') as ProcessorType;
  
  switch (processorType) {
    case 'KAFKA':
      return await sendKafkaDepositEvent(event);
    case 'API':
      return await sendApiDepositEvent(event);
    default:
      throw new Error(`Unsupported processor type: ${processorType}`);
  }
} 