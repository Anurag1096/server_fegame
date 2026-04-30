import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello this is codeees';
  }

  postData(data: ReadableStream<Uint8Array<ArrayBuffer>> | null):string{
    return "Your message is saved"
  }
}


