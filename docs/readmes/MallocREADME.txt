README
Private repo at https://github.com/canovalentina/malloc 
Code shared upon request

Student: Valentina Cano (vcano)
Project: 

MALLOC

I) General program layout: 

	I.a) Global variables: For this program, I only have one global variable *explicit_free_list (more in part III)

	I.b) Header file: contains MACROS (represent wordsize, minimum block size, how much the heap will be extended by, and a routine to maintain alignment by size), and a series of static inline helper functions (more in part I.c.1) 

	I.c) Functions:

		I.c.1) Helper functions: 
			-Static inlines:
				-These functions provide a lot of necessary functionality to be able to manipulate the blocks (get the pointers to the different parts of the block, provide the necessary header/footer information relative to a pointer to the block's payload, manipulate prev and next pointers, etc.) more efficiently. Using these rather than Macros made it easier to debug and also provided type checking. 
				-For more specific explanation, see header and inline comments of each of these functions.
				-Note: both pull_free_block(void *fb) and insert_free_block(void *fb) have a bit of a complicated double pointer dereferencing. 
				This is given that you want to create a pointer to the value of a pointer. 
					-To get the value of the prev value of a free block, you simply point to the start of the block (prev pointer is at the start of the payload): (*(void **)(fb));
					-To get the value of the next, it is the same process but with an offest of 8 (DSIZE), because that is the size of the prev pointer:  (*(void **)(fb + DSIZE)); 

			-In mm.c file: 
				-I defined static helper functions to factor out some of the allocation functionality coalesce(), extend_heap() and place_block() (more in parts IV and V)
				-Also defined a helper function for check_heap called print_check_block(). 

		I.c.2) Main functions: mm_init() initializes the heap, mm_malloc() allocates a block and mm_free() frees a block (more in part IV)

	I.d) Others: 
		- For most pointers, I decided to use void *
		- For sizes, I decided to use int, given that the helper functions provided as a stencil had a get_size() method with a return type of type int. Therefore, I thought it should be consistent. But still, I left the function signature of malloc() the same.
		- Names of variables: in general, when a block is passed in as a parameter it is refered to as *b. If we know the method will pass in a free block, then *fb. In the main fucntions, the block is refered to as ptr to maintain consistency with the stencil. 

II) Structure of memory blocks: 

	II.a) General: 
		-All blocks have a 4-byte header and a 4-byte footer
		-In my implementation, the block pointers point to the payload. Therefore, I have the necessary helper functions *block_starttag(void *b) and *block_endtag(void *b) to be able to point to the header and footer respectively.

	II.b) Free blocks: 
		- The minimum block size is 24: 8 bytes for the header and footer

		======================
		Block size || free (0)  -> HEADER: 4 bytes
		----------------------
		         
		         PREV           -> 8 bytes

		----------------------
		        
		         NEXT           -> 8 bytes

		----------------------
		Block size || free (0)  -> FOOTER: 4 bytes
		======================

	II.c) Allocated blocks:

		=======================
		Block size || alloc (1)  -> HEADER: 4 bytes
		-----------------------
		

		        Payload          -> ? bytes, 8 byte aligned
	

		-----------------------
		Block size || alloc (1)  -> FOOTER: 4 bytes
		=======================


III) Organization of free blocks: 
	-The start of the free_list is stored as a global variable. The way that free blocks are kept track of is by having prev and next tags in what their "payload" would be. This way, it is esentially a "doubly linked list" of free blocks. 


IV) How allocator manipulates free blocks:
	-The malloc function uses the first-fit approach. It starts at the beginning of the explicit_free_list and until it finds a free block that is big enough. 
		-even though this may concentrate the memory at a certain area, it is a good tradeoff if you want to minimie the amount of operations performed. 
	-When finding a block that is big enough, call on place_block(), which takes care of the necessray updating of headers and footers, splitting and coalescing (see part V). 
	-If there is no block that is big enough, then call on the extend_heap() function (see VI.b) and place the block at the pointer that the extend_heap function returns. 

V) Strategy for maintaining compaction: 

	V.a) Splitting blocks:
		-Coalescing (V.b) is very important to avoid fragmentation. Nevertheless, it is also importnat to not have blocks which are too big. In the place_block() helper method there is a mechanism that takes care of splitting blocks. The way it does this is the following: 
			-if when allocating memory to a block there is not enough space (something >= MINBLOCKSIZE) to split, then simply allocate the block and remove from the free list
			-if when allocating memory to the block there is enough space to allocate mmeory and create a new free block, then: 
				-allocate the block, adjust headers and footers
				-create a new free block and create the necessray pointers to it.  

	V.b) Coalescing blocks: 
		-Coalescing is used so that it is not the case that there is enough free memory, but it is too split up into tiny fragments. esentially, what this function does is, if there is a free block next to you, merge and create a bigger block.  
		-It is divided into three cases depending on whether, for a given block, the prev, the next or both are free. If any are free, then the following steps are taken:
			-Increment the size with the size of the block(s) your are merging with 
			-Remove the block that you are  merging with
			-Update the header and the footer of the merged block
		-Given that there is a prologue and an epilogue, we can ignore the edge cases where the requested block is at the begnning or end of the heap. 


VI) Heap 

	VI.a) Heap initialization: 

	memsbrk(48): 
		======================
		                        -> Alignment padding: 4 bytes
		======================
		      DSIZE || 1        -> Prologue HEADER: 4 bytes
		----------------------
		      DSIZE || 1        -> Prologue FOOTER: 4 bytes
		======================
		  MINBLOCKSIZE || 1     -> Initial Block HEADER: 4 bytes
		----------------------
		      					<------*explicit_free_list
		      PREV = 0          -> Initial Block PREV: 8 bytes       

		----------------------
		     
		      NEXT = 0          -> Initial Block NEXT: 8 bytes

		----------------------
		  MINBLOCKSIZE || 1     -> Initial Block FOOTER: 4 bytes
		======================
		       0 || 1           -> Epilogue HEADER: 4 bytes (size = 0)
		======================
		                        
								-> (extra 8 bytes)
		  
		======================


	VI.b) extend_heap(): the extend heap function is defined to be called on when there is not enough space in the heap. Given a number of words you want to add to memory (make it an even number), you want to call mem_sbrk() to request additional memory, and then make a new epilogue.


	VI.c) Heap checker: Checks each individual block using the helper method. Also checks that the epilogue (block with size 0, at the end) is allocated. 
	
		IV.c.1) Helper method: print_check_block() does the following: 
			-Checks whether the block is 8 byte aligned (using the %8 operand)
			-Checks that the block is inside of the heap by using mem_heap_lo() and mem_heap_hi() methods.
			-Prints out the allocation status, adress and size of each block
				-if it is free, then it also prints out the prev and next pointers of the block. 

VII) Extra credit

	VII.a) Performance: 
		V.a.1) Space utilization: 
			-To minimize internal fragmentation, I have a mechinaism that splits blocks everytime a new block is placed
			-To minimize external fragmentation, I coalesce when extending heap and when placing a block 
		V.a.2) Throughput
			-I discovered that if I find free blocks inside of mm_malloc() instead of having a helper function this made the program more efficient
			-Whenever there is an error, the function returns instead of simply printing out a message to avoid continuing in the algorithm if there is an error

	VII.b) mm_realloc():
		-I did not implement realloc() and therefore defined a macro UNUSED to avoid errors when compiling. 



Point