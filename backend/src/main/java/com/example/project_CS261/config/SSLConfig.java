package com.example.project_CS261.config;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.TrustManagerFactory;
import java.security.KeyStore;

/**
 * SSL Configuration สำหรับเชื่อมต่อกับ TU API อย่างปลอดภัย
 */
@Configuration
public class SSLConfig {

    /**
     * สร้าง SSL Context ที่ใช้ System Default Trust Store
     */
    @Bean
    public SslContext sslContext() throws Exception {
        // ใช้ TrustManagerFactory แบบ default ของ Java
        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(
                TrustManagerFactory.getDefaultAlgorithm()
        );
        
        // ใช้ default KeyStore ของ Java (มี root certificates ในตัว)
        trustManagerFactory.init((KeyStore) null);
        
        // สร้าง SslContext
        return SslContextBuilder
                .forClient()
                .trustManager(trustManagerFactory)
                .build();
    }
}
