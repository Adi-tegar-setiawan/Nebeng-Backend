import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditTrail');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        if (method !== 'GET') {
          const userId = user ? user.id : 'ANONYMUS';
          const delay = Date.now() - now;
          this.logger.log(
            `[AUDIT] User: ${userId} | ${method} ${url} | Executed in ${delay} ms`,
          );
        }
      }),
    );
  }
}
