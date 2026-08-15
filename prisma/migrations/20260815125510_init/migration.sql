-- CreateTable
CREATE TABLE `regions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `regions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `region_id` BIGINT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('superadmin', 'admin_wilayah', 'operator_pos', 'mitra', 'customer') NOT NULL,
    `status` ENUM('active', 'suspended', 'blocked') NOT NULL DEFAULT 'active',
    `status_verification` ENUM('unverified', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'unverified',
    `pin_hash` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `reward_points` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `ktp_number` VARCHAR(191) NULL,
    `full_name_ktp` VARCHAR(191) NULL,
    `address_ktp` TEXT NULL,
    `face_image_url` VARCHAR(191) NULL,
    `is_face_verified` BOOLEAN NOT NULL DEFAULT false,
    `bank_name` VARCHAR(191) NULL,
    `bank_account_number` VARCHAR(191) NULL,
    `bank_account_holder` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `approved_by_user_id` BIGINT NULL,
    `type` ENUM('ktp', 'sim', 'skck', 'stnk') NOT NULL,
    `status` ENUM('unverified', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `rejection_reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_files` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `verification_id` BIGINT NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `file_type` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pickup_points` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `region_id` BIGINT NOT NULL,
    `city_id` BIGINT NOT NULL,
    `operator_id` BIGINT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `qr_code_pos` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pickup_points_qr_code_pos_key`(`qr_code_pos`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_settings` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `service_type` ENUM('motor', 'mobil', 'barang') NOT NULL,
    `base_fare` DECIMAL(10, 2) NOT NULL,
    `fare_per_km` DECIMAL(10, 2) NOT NULL,
    `fare_per_kg` DECIMAL(10, 2) NULL,
    `admin_fee_percentage` DECIMAL(5, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trips` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `mitra_id` BIGINT NOT NULL,
    `origin_point_id` BIGINT NOT NULL,
    `destination_point_id` BIGINT NOT NULL,
    `vehicle_type` ENUM('motor', 'mobil') NOT NULL,
    `departure_date` DATE NOT NULL,
    `departure_time` TIME NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `seat_total` INTEGER NOT NULL,
    `seat_available` INTEGER NOT NULL,
    `max_weight_capacity_kg` DECIMAL(8, 2) NOT NULL,
    `remaining_weight_capacity_kg` DECIMAL(8, 2) NOT NULL,
    `qr_code_trip` VARCHAR(191) NOT NULL,
    `status` ENUM('scheduled', 'in_origin_pos', 'in_transit', 'arrived_dest_pos', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    `maps_polyline` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `trips_qr_code_trip_key`(`qr_code_trip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `trip_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `type` ENUM('passenger', 'parcel') NOT NULL,
    `seats_booked` INTEGER NOT NULL DEFAULT 0,
    `total_items_count` INTEGER NOT NULL DEFAULT 0,
    `total_weight_kg` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `qr_code_ticket` VARCHAR(191) NOT NULL,
    `otp_claim` VARCHAR(191) NULL,
    `readiness_status` VARCHAR(191) NULL,
    `status` ENUM('pending_payment', 'paid', 'checked_in_origin', 'in_transit', 'arrived_destination', 'completed', 'cancelled') NOT NULL DEFAULT 'pending_payment',
    `escrow_status` ENUM('pending', 'held', 'released', 'refunded') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_qr_code_ticket_key`(`qr_code_ticket`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `item_category` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `weight_per_item_kg` DECIMAL(8, 2) NOT NULL,
    `total_item_weight_kg` DECIMAL(8, 2) NOT NULL,
    `size_enum` ENUM('xxs', 'xs', 's', 'm', 'l', 'xl') NOT NULL,
    `photo_url` VARCHAR(191) NULL,
    `security_seal_qr` VARCHAR(191) NULL,
    `recipient_name` VARCHAR(191) NOT NULL,
    `recipient_phone` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `item_orders_security_seal_qr_key`(`security_seal_qr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkpoints_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `trip_id` BIGINT NOT NULL,
    `order_id` BIGINT NOT NULL,
    `pos_id` BIGINT NOT NULL,
    `scanned_by_user_id` BIGINT NOT NULL,
    `scan_type` ENUM('checkin_origin', 'checkin_destination') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_qr_sessions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `trip_id` BIGINT NOT NULL,
    `qr_token` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT false,
    `expired_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_qr_sessions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `qr_token` VARCHAR(191) NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT false,
    `expired_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_trackings` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `trip_id` BIGINT NOT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `payment_gateway` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending', 'success', 'failed', 'refunded') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `held_escrow_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallets_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `wallet_id` BIGINT NOT NULL,
    `order_id` BIGINT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `type` ENUM('credit', 'debit', 'escrow_hold', 'escrow_release') NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reward_transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `points` INTEGER NOT NULL,
    `type` ENUM('earn', 'redeem') NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `trip_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `mitra_id` BIGINT NOT NULL,
    `is_locked` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT NOT NULL,
    `sender_id` BIGINT NOT NULL,
    `message_text` TEXT NOT NULL,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_reviews` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `trip_id` BIGINT NOT NULL,
    `reviewer_id` BIGINT NOT NULL,
    `reviewee_id` BIGINT NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verifications` ADD CONSTRAINT `verifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verifications` ADD CONSTRAINT `verifications_approved_by_user_id_fkey` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_files` ADD CONSTRAINT `verification_files_verification_id_fkey` FOREIGN KEY (`verification_id`) REFERENCES `verifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pickup_points` ADD CONSTRAINT `pickup_points_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pickup_points` ADD CONSTRAINT `pickup_points_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pickup_points` ADD CONSTRAINT `pickup_points_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_origin_point_id_fkey` FOREIGN KEY (`origin_point_id`) REFERENCES `pickup_points`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_destination_point_id_fkey` FOREIGN KEY (`destination_point_id`) REFERENCES `pickup_points`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_orders` ADD CONSTRAINT `item_orders_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkpoints_log` ADD CONSTRAINT `checkpoints_log_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkpoints_log` ADD CONSTRAINT `checkpoints_log_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkpoints_log` ADD CONSTRAINT `checkpoints_log_pos_id_fkey` FOREIGN KEY (`pos_id`) REFERENCES `pickup_points`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkpoints_log` ADD CONSTRAINT `checkpoints_log_scanned_by_user_id_fkey` FOREIGN KEY (`scanned_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_qr_sessions` ADD CONSTRAINT `trip_qr_sessions_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_qr_sessions` ADD CONSTRAINT `order_qr_sessions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_trackings` ADD CONSTRAINT `trip_trackings_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reward_transactions` ADD CONSTRAINT `reward_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_reviews` ADD CONSTRAINT `trip_reviews_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_reviews` ADD CONSTRAINT `trip_reviews_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_reviews` ADD CONSTRAINT `trip_reviews_reviewee_id_fkey` FOREIGN KEY (`reviewee_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
