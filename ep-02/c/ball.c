#include "ball.h"
#include "main.h"
#include "levels.h"

/**
	* Update ball updates the position based
	* on tilt status.
 **/
void update_ball(ball_t *ball, tilt board_tilt){
	// Draw over past ball
	lcd_draw_image(ball->x, IMG_WIDTH, ball->y, IMG_HEIGHT, ball_image, MB_GRASS, MB_GRASS);
	// Update position
	ball->x_hres += ball->x_speed;
	ball->y_hres += ball->y_speed;
	// Update speed
	ball->y_speed_target = board_tilt.y / SPEED_FACTOR;
	ball->x_speed_target = -1 * (board_tilt.x / SPEED_FACTOR);
	ball->x_speed += (ball->x_speed_target - ball->x_speed) / EASING;
	ball->y_speed += (ball->y_speed_target - ball->y_speed) / EASING;
	// Bounds check
	if(((int)ball->x_hres) < (IMG_WIDTH/2) * SCALING_FACTOR )
		ball->x_hres = (IMG_WIDTH/2) * SCALING_FACTOR;
	if(((int)ball->y_hres) < (IMG_WIDTH/2) * SCALING_FACTOR)
		ball->y_hres = (IMG_WIDTH/2) * SCALING_FACTOR;
	if(ball->x_hres > (COLS - IMG_HEIGHT/2)*SCALING_FACTOR)
		ball->x_hres = (COLS - IMG_HEIGHT/2)*SCALING_FACTOR;
	if(ball->y_hres > (ROWS - IMG_WIDTH/2)*SCALING_FACTOR)
		ball->y_hres = (ROWS - IMG_WIDTH/2)*SCALING_FACTOR; 
	// Figure out current x position to draw
	ball->x = ball->x_hres / SCALING_FACTOR;
	ball->y = ball->y_hres / SCALING_FACTOR;
	// Draw to screen
	lcd_draw_image(ball->x, IMG_WIDTH, ball->y, IMG_HEIGHT, ball_image, MB_BALL, MB_GRASS);
}

//Method that checks if the ball is in a valid spot on the board to continue game
//Returns: 0 if ball is in grass -- continue game, otherwise returns 1 if
//					is in lava, 2 if hit an obstical, or 3 for winzone
int8_t check_ball_status(ball_t *ball, uint8_t (*lvl)[15]){
	int8_t x_coord = s2b_x(ball->x);
	int8_t y_coord = s2b_y(ball->y);
	int8_t hb_horiz	= 6; // Horizontal "hit box" in px
	int8_t hb_diag	= 7; // Diaganol "hit box" in px
	int8_t return_val = lvl[y_coord][x_coord];
	if(return_val != 0)
		return return_val;
	// For the ball, we will check not only what block the center is
	// touching, but also the edges, will return a non-zero value with higher priority
	x_coord = s2b_x(ball->x + hb_horiz); // Right edge
	return_val = lvl[y_coord][x_coord] != 0 ? lvl[y_coord][x_coord] : return_val;
	x_coord = s2b_x(ball->x - hb_horiz); // Left edge
	return_val = lvl[y_coord][x_coord] != 0 ? lvl[y_coord][x_coord] : return_val;
	y_coord = s2b_y(ball->y + hb_horiz); // Top Edge
	return_val = lvl[y_coord][x_coord] != 0 ? lvl[y_coord][x_coord] : return_val;
	y_coord = s2b_y(ball->y - hb_horiz); // Bottom Edge
	return_val = lvl[y_coord][x_coord] != 0 ? lvl[y_coord][x_coord] : return_val;
	// Check Diaganols
	x_coord = s2b_x(ball->x + hb_diag); // TR
	y_coord = s2b_y(ball->y + hb_diag); //
	return_val = lvl[y_coord][x_coord] != 0 ? lvl[y_coord][x_coord] : return_val;
	x_coord = s2b_x(ball->x + hb_diag); // BR
	y_coord = s2b_y(ball->y - hb_diag); //
	return_val = lvl[y_coord][x_coord] != 0 ? lvl[y_coord][x_coord] : return_val;
	x_coord = s2b_x(ball->x - hb_diag); // TL
	y_coord = s2b_y(ball->y + hb_diag); //
	return_val = lvl[y_coord][x_coord] != 0 ? lvl[y_coord][x_coord] : return_val;
	x_coord = s2b_x(ball->x - hb_diag); // BL
	y_coord = s2b_y(ball->y - hb_diag); //
	return_val = lvl[y_coord][x_coord] != 0 ? lvl[y_coord][x_coord] : return_val;
	return return_val;
}
