#ifndef __BALL_H__
#define __BALL_H__
#include "main.h"
#include "graphics.h"
#include "lcd.h"
#include "accel.h"

typedef struct{
	int16_t x;
	int16_t y;
}tilt;

typedef struct{
	// Current position in pixel coordinates
	uint16_t x;
	uint16_t y;
	// Keep position at a higher resolution and project down to render
	uint16_t x_hres;
	uint16_t y_hres;
	// Current speed (at higher resolution)
	int16_t x_speed;
	int16_t y_speed;
	// Target speed to increment to (pure scaled tilt values)
	int16_t x_speed_target;
	int16_t y_speed_target;
}ball_t;

#define SCALING_FACTOR 12
#define SPEED_FACTOR 100
#define EASING 5

void update_ball(ball_t* b, tilt t);
int8_t check_ball_status(ball_t *ball, uint8_t (*lvl)[15]);

#endif
