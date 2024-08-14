README
Private repo at https://github.com/canovalentina/shell 
Code shared upon request

Student: Valentina Cano (vcano)
Project: 

                                      
    //   ) )                          
   ((        / __      ___     // //  
     \\     //   ) ) //___) ) // //   
       ) ) //   / / //       // //    
((___ / / //   / / ((____   // //     
                                    

Shell was written in two parts, below are the README files for both. 


SHELL 1

I) Program Organization: 

	I.a) Important variables: 
		-Constants: I define BUFSIZE, TOK_BUFSIZE 70 and TOK_DELIM, describing the max size of the command line , the max size of the arguments and the tokenizing delimiters respectively. 
		-Global variables: my standard input, standar output and append are defined as global variables char *std_in, *std_out, *append, respectively. They will be updated and assigned when necessary throught the program. 

	I.b) Important functions: 

		1) Handling redirection: 
			-Defined an is_redir function which, by using strcmp, returns the following values: 
				-1 if token is "<", 2 if ">" and 3 if ">>"
				-0 if it is not a redirection symbol
			-the handle_redirection(int redirection) will take in the number that is_redir returns, and then set the variables std-in, std-out and append respectively, and handle necessary errors (expecting argument, already set)
			-NOTE: The actual open, dup2 and close on the std_in, std_out and append are performed in the fork_execution() method.

		2) String parsing: 
			-I have a parse_line functions which takes in the command line (buf, which we can assume will have a max length of 1024) and the argv, which are intialized in main. It will read from buf, and then tokenize, adding to argv if necessary, or setting to the files if a redirection symbol is found.
			-It will only add to argv and increment argc if the token is not a redirection symbol.  
				-is_redir stored in a variable.
			-To factor out some code, I have a seperate handle_redirection method which is called on in the parse_line function (explained in (a-))

		3) Built-ins: 
			-I made separate functions for the built-in commands, that call on the repsective system calls and handle necessary errors, and also print out an error if the arguments are insufficient or not what expected for that function. 
				-These helper functions are: sh_changedir, sh_remove, sh_link
				-Given that exit simply exits the program a helper function was not necessary
			-Then, I have a built_in() function which will call on these methods, depending on what is passed in to the command line (which is checked using strcmp()). This method will return 1 if any was executed and 0 if not. This will be useful in main() t know whether or not
			-Note: Given that we are using the system calls, it is not necessary to call fork. 

		4) fork_execution(): 
			-performs if something in argv[0]. If not, will simply return 0
			-First, calls on fork and exits if returns an error. 
			-If fork == 0 then continue with child process. 
			-takes care of the open(), dup2() and close(), to be able to open, create a duplicate and establish the correct file descriptors, and close the files that store std_in, std_out and append respectively.
				--> Depending on whether it is std_in, std_out or append, the necessary flags are stated to open. 
				--> The mode passed in to open is 0644, which specifies: owner: read and write permissions, group: only read permissions, others: only read permissions. 
			-calls on execv() to execute necessary call on argv[0], and then hanldes error if necessray.
				-Uses errno, which stores the last error performed by syscall.

		5) Main: 
			-Declares buf and argv. 
			-Defines what will be printed if the PROMPT macro is defined 
			-Declares the REP loop which: parses command line; if argv[0] isn't 0, then perform builtin, or execution; reset buf


	I.c) Header: I included a header file shell_1 that has the name of my methods, to make the code look cleanr and also to avoid errors from calling functions that haven't yet been defined. 
		-Also #include necessary libraries for my system calls and C functions. 

	I.d) System calls: 
		-read(): to read from the command line, 
		-For built-in functions: chdir() for cd, link() for ln, unlink() for rm
		-execv() to execute process specified in argv[0].  
		-open(), dup2() and close(). Explained in ((d-))
		- strtok() tokenize string for string parsing.
		- strcmp() to check if strings are equal.
		-memset() to initialize (and reinitialize) buf

	I.e) Error handling: 
		-System calls: 
			-To check errors on system calls i check whether their return value is that of an error (<0), and then call perror() and exit program.
			-When I use perror() I state the name of the function, as the man pages state that this is the most useful way to use perror()
		-For errors that are not from syscalls, the following procedure is followed: 
			-declare a char msg_buf[128] at the beginning of the function 
			-call sprintf apssing in the msg_bug, and the message I want to print out, and store what sprintf returns in a variable num_chars. 
			-using the wrapped write function (which handles errors), will to stderr like this: write(STDERR_FILENO, msg_buf, (size_t)num_chars);

			-Errors checked: 
					-ln expects two arguments
					-rm expects an argument
					-chdir expects an argument
					-expecting argument after redirection symbol
					-can't set std-in, std-out or append twice
					-failure execv

	I.f) Interpositioning write(): 
		-Wrote a wrapper function for write which handles errors. This is done by using interpositiong and adding the corresponding -wrap flag to the Makefile

II) Known bugs: 
	-When calling /bin/bug says "command not found" instead of "make sure parameters are parsed correctly"

III) Compilation: See Makefile. Have 33sh and 33noprompt, and then one all which makes both at the same time. Also have a clean to be able to remove the current executables. Add wrap flag for write.  


--------------

README Shell 2
Valentina Cano (vcano) 

I) Program Organization: 

I.a) General outline of added functionality: For this project, we had to implement extra functionality to our shell_1.
The methods added were the following: int is_bg(char *token), void ignore_signals(), void default_signals(), void reap_background(), void reap_foreground(pid_t fgpid), int jobs_fg_bg(char **argv). To be able to call these methods, the fork_execution() and main() methods also have added code which is specified with a comment /* SHELL 2*/. 

I.b) Parts of added functionality:

	Part I) Signals: 
		-Functions: created helper functions ignore_signals() and default_signals() to be able to perform the desired behavior on SIGINT, SIGQUIT, SIGCONT and SIGTTOU.
		-Called: we want to ignore signals when the shell has the control of the terminal itself, to avoid exiting from the shell. Therefore, it is called before the REPL. Then, in the child process we want to set the signals back to default before executing them. default_signals() is called in the fork_execution() function, before execv().
		-Process groups: Whenever forking into a child process, we must change its process group, because it is currently set to that of the parent, by calling setpgid(0,0). We also want to ensure signals are sent to the right process, by calling tcsetgrp() on foreground processes. 
			-Error checking: if setpgid returns -1, if tcsetpgrp returns -1 and the errno isn't ENOTTY (which is set if the filedes is not associated with a terminal device)

	Part II) Multiple jobs: 
		-&: in the end of the parse_line function, I check if the last argument is set to &. If it is, then the variable that stores whether or not it is a background process (more on this in part 4) is set to true (1), and the & is deleted from the array of arguments by calling argv[argc-1] = NULL;
		-we will keep track of the list of jobs, by using the support code. jobslist is stored as a global variable. It is initlized in main() using the support code method, and it is cleaned up at the end of main and also if no command is typed in (if when reading the command line the length == 0)
		-at the end of the fork, jobs are added to the jobslist by using the support code, and the current jidcount, and then jidcount is incremented 

	Part III) Reaping: 
		We want to reap processes to handle "zombie processes". Given that there can be only one foregorund job, nut multiple background jobs, i created a fucntionb that handles the two different types.
		-waitpid(): both types of reaping will use the waitpid command. 
		-Called: reap_background is called in the beginning of the REPL, reap_foreground, is called when forking into a child process in the fork_execution() method. 
		-foreground reaping: 
			-the only flag is WUNTRACED given that you only want to reap a fg priocess if the child process has been stopped.
			-given that it is called in fork_execution, this function passes in a pid as an argumet, which will be given by the pid that fork() returns.
			-by calling waitpid, we will have the pid of the process.
			-after calling waitpid, depending on the status we will print the necessary messages
				-we use the support code to get the jid 
				-if a process terminated normally, we want to remove the pid; if a signal was sent to it or it was stopped we want to update the pid
		-background reaping: 
			*from the man pages: "return value of waitpid >0 means wait for the child whose process ID is equal to the value of pid."
			-Background reaping is similar, but we want ot perform a while loop instead which will continue calling wait pid while its return value is greater than 0.
			-given that background processes can be restarted and continued, there are more flags that must be set: additional to WUNTRACED, we want to add WNOHANG and WCONTINUED. Moreover, we also want to print out the "resumed" message if a process was continued
		-Error checking: 
			-system calls: waitpid, if there is an errno which isn't ECHILD (which simply says that there aren't any child processes)
			-Support code: if remove_job_pid or update_job_pid return -1


	Part IV) fg and bg:

		-To be able to perform the functionality of the fg and bg commands, I have a helper function called jobs_fg_bg() which executes the necessary fucntionality of these commands. this function will return 0 if the argv[0] wasn't any of jobs, fg or bg and 1 if it was. Therefore, similar as to what I did with built_in command, we can call jobs_fg_bg in main, and if this function returns 0 pass on to perform fork_execution().
		-for jobs(), it simply calls on the support code function.
		-fg(): we want to perform the command based on a jid passed in as the argument as %jid. The %jid will have been stored in ragv[1]. to be able to grab the numerical value, I increment the pointer by 1 (to not take into account the %, and then atoi argv[1]. Then we want to get the pid, and using this pid, send SIGCONT signal to the stopped job, by using the kill() system call. in fg it is also necessray to call the necessray tcsetgrp and reap processes to be able to manage that there should only be one foreground process.
			-Note: call kill on -pid, because "when pid is less than -1, then sig is sent to every process in the process group whose ID is -pid"
		-bg(): it is similar to the fg, simply ommiting the tcsetgrp and reaping, because the reaping of background processes is performed in main.
		-How to know if fg or bg? I have a global variable called bg which is updated correspondingly depending on whether a job is set as a fg or a bg job. It is called bg, so a 1 represents bg jobs and a 1 represents fg job.
		-Error checking: 
			-jobs: if any argument is passed in after command, then syntax error.
			-fg and bg: syntax errors if no arguyment is passed in or if argument doesn't start with a %
			-system calls: kill, tcsetgrp/ support code: get_job_pid. If they return -1.   


II) Known bugs: & only works when it has a space before. 
Point