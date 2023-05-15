-- MySQL Script generated by MySQL Workbench
-- Mon May 15 08:35:41 2023
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema elite-motion
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema elite-motion
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `elite-motion` DEFAULT CHARACTER SET utf8 ;
USE `elite-motion` ;

-- -----------------------------------------------------
-- Table `elite-motion`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `elite-motion`.`users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `mail` VARCHAR(100) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `firstname` VARCHAR(45) NULL,
  `lastname` VARCHAR(45) NULL,
  `birthdate` VARCHAR(45) NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `mail_UNIQUE` (`mail` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `elite-motion`.`training_sessions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `elite-motion`.`training_sessions` (
  `training_session_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `users_user_id` INT NOT NULL,
  PRIMARY KEY (`training_session_id`, `users_user_id`),
  INDEX `fk_training_sessions_users1_idx` (`users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_training_sessions_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `elite-motion`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `elite-motion`.`exercices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `elite-motion`.`exercices` (
  `exercice_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(500) NULL,
  `reps` INT NULL,
  `sets` INT NULL,
  `users_user_id` INT NOT NULL,
  PRIMARY KEY (`exercice_id`, `users_user_id`),
  INDEX `fk_exercices_users1_idx` (`users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_exercices_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `elite-motion`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `elite-motion`.`training_sessions_group_exercices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `elite-motion`.`training_sessions_group_exercices` (
  `training_sessions_training_session_id` INT NOT NULL,
  `exercices_exercice_id` INT NOT NULL,
  PRIMARY KEY (`training_sessions_training_session_id`, `exercices_exercice_id`),
  INDEX `fk_training_sessions_has_exercices_exercices1_idx` (`exercices_exercice_id` ASC) VISIBLE,
  INDEX `fk_training_sessions_has_exercices_training_sessions1_idx` (`training_sessions_training_session_id` ASC) VISIBLE,
  CONSTRAINT `fk_training_sessions_has_exercices_training_sessions1`
    FOREIGN KEY (`training_sessions_training_session_id`)
    REFERENCES `elite-motion`.`training_sessions` (`training_session_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_training_sessions_has_exercices_exercices1`
    FOREIGN KEY (`exercices_exercice_id`)
    REFERENCES `elite-motion`.`exercices` (`exercice_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `elite-motion`.`users_sessions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `elite-motion`.`users_sessions` (
  `users_session_id` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(512) NOT NULL,
  `end_date` VARCHAR(45) NOT NULL,
  `users_user_id` INT NOT NULL,
  PRIMARY KEY (`users_session_id`, `users_user_id`),
  INDEX `fk_users_sessions_users1_idx` (`users_user_id` ASC) VISIBLE,
  UNIQUE INDEX `token_UNIQUE` (`token` ASC) VISIBLE,
  CONSTRAINT `fk_users_sessions_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `elite-motion`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `elite-motion`.`schedules`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `elite-motion`.`schedules` (
  `schedule_id` INT NOT NULL AUTO_INCREMENT,
  `date` VARCHAR(45) NULL,
  `training_sessions_training_session_id` INT NOT NULL,
  `training_sessions_users_user_id` INT NOT NULL,
  PRIMARY KEY (`schedule_id`, `training_sessions_training_session_id`, `training_sessions_users_user_id`),
  INDEX `fk_schedules_training_sessions1_idx` (`training_sessions_training_session_id` ASC, `training_sessions_users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_schedules_training_sessions1`
    FOREIGN KEY (`training_sessions_training_session_id` , `training_sessions_users_user_id`)
    REFERENCES `elite-motion`.`training_sessions` (`training_session_id` , `users_user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
